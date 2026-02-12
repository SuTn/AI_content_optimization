import { NextRequest, NextResponse } from 'next/server';
import { AIConfig, TemplateId, AnyTemplateId } from '@/types/ai';
import { getLayoutOptimizationPrompt } from '@/lib/prompts/layoutPrompts';
import { getTemplatePrimaryColor } from '@/lib/templateLayouts';
import { getTemplateById } from '@/lib/templateStorage';

export const runtime = 'edge';

interface OptimizeRequest {
  content: string;
  templateId: AnyTemplateId;
  config: AIConfig;
  useChunking?: boolean;
  maxTokens?: number;
}

interface TestRequest {
  config: AIConfig;
}

/**
 * POST handler for optimization
 */
export async function POST(req: NextRequest) {
  try {
    const body: OptimizeRequest = await req.json();
    const { content, templateId, config, useChunking = false, maxTokens = 8000 } = body;

    // Validate request
    if (!content || !templateId || !config) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    if (!config.apiKey) {
      return NextResponse.json(
        { error: 'API Key 未配置' },
        { status: 400 }
      );
    }

    // Check if content needs chunking
    const contentTokens = content.length;

    // Only use chunking for very long content (over 10000 chars)
    if (contentTokens > 10000) {
      return NextResponse.json({
        success: true,
        needsChunking: true,
        message: `内容较长（约 ${contentTokens} 字符），将分段处理`,
      });
    }

    // Prepare API request
    const { baseUrl, apiKey, model, temperature, maxTokens: configMaxTokens } = config;

    // Build request body based on provider
    const requestBody: Record<string, any> = {
      model,
      messages: [
        {
          role: 'system',
          content: getSystemPrompt(templateId),
        },
        {
          role: 'user',
          content: getOptimizePrompt(templateId, content),
        },
      ],
      temperature,
      stream: true,
    };

    // Add max_tokens based on provider
    if (config.provider === 'openai') {
      requestBody.max_completion_tokens = configMaxTokens;
    } else {
      requestBody.max_tokens = configMaxTokens;
    }

    console.log('[AI Optimize] Request:', {
      provider: config.provider,
      model,
      baseUrl,
      hasApiKey: !!apiKey,
      contentLength: content.length,
      templateId,
    });

    // Call LLM API
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AI Optimize] API Error:', response.status, errorText);

      let errorMessage = `API 请求失败 (${response.status})`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage += `: ${errorJson.error?.message || errorJson.message || errorText}`;
      } catch {
        errorMessage += `: ${errorText}`;
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    console.log('[AI Optimize] API Response OK, starting stream...');

    // Stream the response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.error(new Error('无法读取响应流'));
          return;
        }

        const decoder = new TextDecoder();
        let buffer = '';

        try {
          let chunkCount = 0;
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              console.log('[AI Optimize] Stream done, total chunks:', chunkCount);
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
              controller.close();
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data: ')) continue;

              const data = trimmed.slice(6);

              if (data === '[DONE]') {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
                continue;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;

                if (content) {
                  chunkCount++;
                  if (chunkCount <= 5) {
                    console.log('[AI Optimize] Chunk', chunkCount, ':', content.substring(0, 50));
                  }
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'content', data: content })}\n\n`));
                }
              } catch (e) {
                console.warn('[AI Optimize] Failed to parse SSE data:', data);
              }
            }
          }
        } catch (error) {
          console.error('[AI Optimize] Stream error:', error);
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({ type: 'error', data: error instanceof Error ? error.message : '流式传输失败' })}\n\n`
          ));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[AI Optimize] Server error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器错误' },
      { status: 500 }
    );
  }
}

/**
 * PUT handler for connection test (separate endpoint to avoid URL length issues)
 */
export async function PUT(req: NextRequest) {
  try {
    const body: TestRequest = await req.json();
    const { config } = body;

    if (!config) {
      return NextResponse.json(
        { success: false, error: '缺少配置参数' },
        { status: 400 }
      );
    }

    if (!config.apiKey) {
      return NextResponse.json(
        { success: false, error: 'API Key 未配置' },
        { status: 400 }
      );
    }

    const { baseUrl, apiKey, model, temperature, maxTokens, provider } = config;

    console.log('[AI Test] Testing connection:', {
      provider,
      model,
      baseUrl,
      hasApiKey: !!apiKey,
    });

    // Build request body
    const requestBody: Record<string, any> = {
      model,
      messages: [
        {
          role: 'user',
          content: '请回复"连接成功"',
        },
      ],
      temperature: 0.1,
      max_tokens: 50,
    };

    // Call LLM API
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AI Test] API Error:', response.status, errorText);

      let errorMessage = `连接测试失败 (${response.status})`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage += `: ${errorJson.error?.message || errorJson.message || errorText}`;

        // Add specific error hints
        if (response.status === 401) {
          errorMessage += '\n\n提示：API Key 可能无效或已过期';
        } else if (response.status === 404) {
          errorMessage += '\n\n提示：API 地址或模型名称可能不正确';
        } else if (response.status === 429) {
          errorMessage += '\n\n提示：请求过于频繁，请稍后再试';
        }
      } catch {
        errorMessage += `: ${errorText}`;
      }

      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 200 } // Return 200 to let client handle the error
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '';

    console.log('[AI Test] Success, reply:', reply);

    return NextResponse.json({
      success: true,
      message: '连接成功',
      reply,
    });
  } catch (error) {
    console.error('[AI Test] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '测试连接失败',
      },
      { status: 200 }
    );
  }
}

/**
 * Get system prompt based on template
 */
function getSystemPrompt(templateId: AnyTemplateId): string {
  // Check if it's a custom template
  const template = getTemplateById(templateId);

  if (template && 'source' in template) {
    // Custom template - use its system prompt
    return template.systemPrompt;
  }

  // Builtin template
  const prompts: Record<TemplateId, string> = {
    simple: '你是一个专业的公众号排版优化助手，擅长将内容优化为简约清晰风格。',
    business: '你是一个专业的公众号排版优化助手，擅长将内容优化为商务专业风格。',
    lively: '你是一个专业的公众号排版优化助手，擅长将内容优化为活泼有趣风格。',
    academic: '你是一个专业的公众号排版优化助手，擅长将内容优化为学术严谨风格。',
    magazine: '你是一个专业的公众号排版优化助手，擅长将内容优化为杂志精美风格。',
  };
  return prompts[templateId as TemplateId] || prompts.simple;
}

/**
 * Get optimization prompt based on template
 */
function getOptimizePrompt(templateId: AnyTemplateId, content: string): string {
  // Use the new layout-based prompt system
  return getLayoutOptimizationPrompt(templateId, content);
}
