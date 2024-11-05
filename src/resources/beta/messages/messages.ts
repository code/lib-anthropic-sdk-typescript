// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../resource';
import { APIPromise } from '../../../core';
import * as Core from '../../../core';
import * as MessagesMessagesAPI from './messages';
import * as MessagesAPI from '../../messages';
import * as BetaAPI from '../beta';
import * as BatchesAPI from './batches';
import {
  BatchCancelParams,
  BatchCreateParams,
  BatchListParams,
  BatchResultsParams,
  BatchRetrieveParams,
  Batches,
  BetaMessageBatch,
  BetaMessageBatchCanceledResult,
  BetaMessageBatchErroredResult,
  BetaMessageBatchExpiredResult,
  BetaMessageBatchIndividualResponse,
  BetaMessageBatchRequestCounts,
  BetaMessageBatchResult,
  BetaMessageBatchSucceededResult,
  BetaMessageBatchesPage,
} from './batches';
import { Stream } from '../../../streaming';

export class Messages extends APIResource {
  batches: BatchesAPI.Batches = new BatchesAPI.Batches(this._client);

  /**
   * Send a structured list of input messages with text and/or image content, and the
   * model will generate the next message in the conversation.
   *
   * The Messages API can be used for either single queries or stateless multi-turn
   * conversations.
   */
  create(params: MessageCreateParamsNonStreaming, options?: Core.RequestOptions): APIPromise<BetaMessage>;
  create(
    params: MessageCreateParamsStreaming,
    options?: Core.RequestOptions,
  ): APIPromise<Stream<BetaRawMessageStreamEvent>>;
  create(
    params: MessageCreateParamsBase,
    options?: Core.RequestOptions,
  ): APIPromise<Stream<BetaRawMessageStreamEvent> | BetaMessage>;
  create(
    params: MessageCreateParams,
    options?: Core.RequestOptions,
  ): APIPromise<BetaMessage> | APIPromise<Stream<BetaRawMessageStreamEvent>> {
    const { betas, ...body } = params;
    return this._client.post('/v1/messages?beta=true', {
      body,
      timeout: (this._client as any)._options.timeout ?? 600000,
      ...options,
      headers: {
        ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined),
        ...options?.headers,
      },
      stream: params.stream ?? false,
    }) as APIPromise<BetaMessage> | APIPromise<Stream<BetaRawMessageStreamEvent>>;
  }

  /**
   * Count the number of tokens in a Message.
   *
   * The Token Count API can be used to count the number of tokens in a Message,
   * including tools, images, and documents, without creating it.
   */
  countTokens(
    params: MessageCountTokensParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<BetaMessageTokensCount> {
    const { betas, ...body } = params;
    return this._client.post('/v1/messages/count_tokens?beta=true', {
      body,
      ...options,
      headers: {
        'anthropic-beta': [...(betas ?? []), 'token-counting-2024-11-01'].toString(),
        ...options?.headers,
      },
    });
  }
}

export interface BetaBase64PDFBlock {
  source: BetaBase64PDFSource;

  type: 'document';

  cache_control?: BetaCacheControlEphemeral | null;
}

export interface BetaBase64PDFSource {
  data: string;

  media_type: 'application/pdf';

  type: 'base64';
}

export interface BetaCacheControlEphemeral {
  type: 'ephemeral';
}

export type BetaContentBlock = BetaTextBlock | BetaToolUseBlock;

export type BetaContentBlockParam =
  | BetaTextBlockParam
  | BetaImageBlockParam
  | BetaToolUseBlockParam
  | BetaToolResultBlockParam
  | BetaBase64PDFBlock;

export interface BetaImageBlockParam {
  source: BetaImageBlockParam.Source;

  type: 'image';

  cache_control?: BetaCacheControlEphemeral | null;
}

export namespace BetaImageBlockParam {
  export interface Source {
    data: string;

    media_type: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

    type: 'base64';
  }
}

export interface BetaInputJSONDelta {
  partial_json: string;

  type: 'input_json_delta';
}

export interface BetaMessage {
  /**
   * Unique object identifier.
   *
   * The format and length of IDs may change over time.
   */
  id: string;

  /**
   * Content generated by the model.
   *
   * This is an array of content blocks, each of which has a `type` that determines
   * its shape.
   *
   * Example:
   *
   * ```json
   * [{ "type": "text", "text": "Hi, I'm Claude." }]
   * ```
   *
   * If the request input `messages` ended with an `assistant` turn, then the
   * response `content` will continue directly from that last turn. You can use this
   * to constrain the model's output.
   *
   * For example, if the input `messages` were:
   *
   * ```json
   * [
   *   {
   *     "role": "user",
   *     "content": "What's the Greek name for Sun? (A) Sol (B) Helios (C) Sun"
   *   },
   *   { "role": "assistant", "content": "The best answer is (" }
   * ]
   * ```
   *
   * Then the response `content` might be:
   *
   * ```json
   * [{ "type": "text", "text": "B)" }]
   * ```
   */
  content: Array<BetaContentBlock>;

  /**
   * The model that will complete your prompt.\n\nSee
   * [models](https://docs.anthropic.com/en/docs/models-overview) for additional
   * details and options.
   */
  model: MessagesAPI.Model;

  /**
   * Conversational role of the generated message.
   *
   * This will always be `"assistant"`.
   */
  role: 'assistant';

  /**
   * The reason that we stopped.
   *
   * This may be one the following values:
   *
   * - `"end_turn"`: the model reached a natural stopping point
   * - `"max_tokens"`: we exceeded the requested `max_tokens` or the model's maximum
   * - `"stop_sequence"`: one of your provided custom `stop_sequences` was generated
   * - `"tool_use"`: the model invoked one or more tools
   *
   * In non-streaming mode this value is always non-null. In streaming mode, it is
   * null in the `message_start` event and non-null otherwise.
   */
  stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence' | 'tool_use' | null;

  /**
   * Which custom stop sequence was generated, if any.
   *
   * This value will be a non-null string if one of your custom stop sequences was
   * generated.
   */
  stop_sequence: string | null;

  /**
   * Object type.
   *
   * For Messages, this is always `"message"`.
   */
  type: 'message';

  /**
   * Billing and rate-limit usage.
   *
   * Anthropic's API bills and rate-limits by token counts, as tokens represent the
   * underlying cost to our systems.
   *
   * Under the hood, the API transforms requests into a format suitable for the
   * model. The model's output then goes through a parsing stage before becoming an
   * API response. As a result, the token counts in `usage` will not match one-to-one
   * with the exact visible content of an API request or response.
   *
   * For example, `output_tokens` will be non-zero, even for an empty string response
   * from Claude.
   */
  usage: BetaUsage;
}

export interface BetaMessageDeltaUsage {
  /**
   * The cumulative number of output tokens which were used.
   */
  output_tokens: number;
}

export interface BetaMessageParam {
  content: string | Array<BetaContentBlockParam>;

  role: 'user' | 'assistant';
}

export interface BetaMessageTokensCount {
  /**
   * The total number of tokens across the provided list of messages, system prompt,
   * and tools.
   */
  input_tokens: number;
}

export interface BetaMetadata {
  /**
   * An external identifier for the user who is associated with the request.
   *
   * This should be a uuid, hash value, or other opaque identifier. Anthropic may use
   * this id to help detect abuse. Do not include any identifying information such as
   * name, email address, or phone number.
   */
  user_id?: string | null;
}

export interface BetaRawContentBlockDeltaEvent {
  delta: BetaTextDelta | BetaInputJSONDelta;

  index: number;

  type: 'content_block_delta';
}

export interface BetaRawContentBlockStartEvent {
  content_block: BetaTextBlock | BetaToolUseBlock;

  index: number;

  type: 'content_block_start';
}

export interface BetaRawContentBlockStopEvent {
  index: number;

  type: 'content_block_stop';
}

export interface BetaRawMessageDeltaEvent {
  delta: BetaRawMessageDeltaEvent.Delta;

  type: 'message_delta';

  /**
   * Billing and rate-limit usage.
   *
   * Anthropic's API bills and rate-limits by token counts, as tokens represent the
   * underlying cost to our systems.
   *
   * Under the hood, the API transforms requests into a format suitable for the
   * model. The model's output then goes through a parsing stage before becoming an
   * API response. As a result, the token counts in `usage` will not match one-to-one
   * with the exact visible content of an API request or response.
   *
   * For example, `output_tokens` will be non-zero, even for an empty string response
   * from Claude.
   */
  usage: BetaMessageDeltaUsage;
}

export namespace BetaRawMessageDeltaEvent {
  export interface Delta {
    stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence' | 'tool_use' | null;

    stop_sequence: string | null;
  }
}

export interface BetaRawMessageStartEvent {
  message: BetaMessage;

  type: 'message_start';
}

export interface BetaRawMessageStopEvent {
  type: 'message_stop';
}

export type BetaRawMessageStreamEvent =
  | BetaRawMessageStartEvent
  | BetaRawMessageDeltaEvent
  | BetaRawMessageStopEvent
  | BetaRawContentBlockStartEvent
  | BetaRawContentBlockDeltaEvent
  | BetaRawContentBlockStopEvent;

export interface BetaTextBlock {
  text: string;

  type: 'text';
}

export interface BetaTextBlockParam {
  text: string;

  type: 'text';

  cache_control?: BetaCacheControlEphemeral | null;
}

export interface BetaTextDelta {
  text: string;

  type: 'text_delta';
}

export interface BetaTool {
  /**
   * [JSON schema](https://json-schema.org/) for this tool's input.
   *
   * This defines the shape of the `input` that your tool accepts and that the model
   * will produce.
   */
  input_schema: BetaTool.InputSchema;

  /**
   * Name of the tool.
   *
   * This is how the tool will be called by the model and in tool_use blocks.
   */
  name: string;

  cache_control?: BetaCacheControlEphemeral | null;

  /**
   * Description of what this tool does.
   *
   * Tool descriptions should be as detailed as possible. The more information that
   * the model has about what the tool is and how to use it, the better it will
   * perform. You can use natural language descriptions to reinforce important
   * aspects of the tool input JSON schema.
   */
  description?: string;

  type?: 'custom' | null;
}

export namespace BetaTool {
  /**
   * [JSON schema](https://json-schema.org/) for this tool's input.
   *
   * This defines the shape of the `input` that your tool accepts and that the model
   * will produce.
   */
  export interface InputSchema {
    type: 'object';

    properties?: unknown | null;
    [k: string]: unknown;
  }
}

export interface BetaToolBash20241022 {
  /**
   * Name of the tool.
   *
   * This is how the tool will be called by the model and in tool_use blocks.
   */
  name: 'bash';

  type: 'bash_20241022';

  cache_control?: BetaCacheControlEphemeral | null;
}

/**
 * How the model should use the provided tools. The model can use a specific tool,
 * any available tool, or decide by itself.
 */
export type BetaToolChoice = BetaToolChoiceAuto | BetaToolChoiceAny | BetaToolChoiceTool;

/**
 * The model will use any available tools.
 */
export interface BetaToolChoiceAny {
  type: 'any';

  /**
   * Whether to disable parallel tool use.
   *
   * Defaults to `false`. If set to `true`, the model will output exactly one tool
   * use.
   */
  disable_parallel_tool_use?: boolean;
}

/**
 * The model will automatically decide whether to use tools.
 */
export interface BetaToolChoiceAuto {
  type: 'auto';

  /**
   * Whether to disable parallel tool use.
   *
   * Defaults to `false`. If set to `true`, the model will output at most one tool
   * use.
   */
  disable_parallel_tool_use?: boolean;
}

/**
 * The model will use the specified tool with `tool_choice.name`.
 */
export interface BetaToolChoiceTool {
  /**
   * The name of the tool to use.
   */
  name: string;

  type: 'tool';

  /**
   * Whether to disable parallel tool use.
   *
   * Defaults to `false`. If set to `true`, the model will output exactly one tool
   * use.
   */
  disable_parallel_tool_use?: boolean;
}

export interface BetaToolComputerUse20241022 {
  /**
   * The height of the display in pixels.
   */
  display_height_px: number;

  /**
   * The width of the display in pixels.
   */
  display_width_px: number;

  /**
   * Name of the tool.
   *
   * This is how the tool will be called by the model and in tool_use blocks.
   */
  name: 'computer';

  type: 'computer_20241022';

  cache_control?: BetaCacheControlEphemeral | null;

  /**
   * The X11 display number (e.g. 0, 1) for the display.
   */
  display_number?: number | null;
}

export interface BetaToolResultBlockParam {
  tool_use_id: string;

  type: 'tool_result';

  cache_control?: BetaCacheControlEphemeral | null;

  content?: string | Array<BetaTextBlockParam | BetaImageBlockParam>;

  is_error?: boolean;
}

export interface BetaToolTextEditor20241022 {
  /**
   * Name of the tool.
   *
   * This is how the tool will be called by the model and in tool_use blocks.
   */
  name: 'str_replace_editor';

  type: 'text_editor_20241022';

  cache_control?: BetaCacheControlEphemeral | null;
}

export type BetaToolUnion =
  | BetaTool
  | BetaToolComputerUse20241022
  | BetaToolBash20241022
  | BetaToolTextEditor20241022;

export interface BetaToolUseBlock {
  id: string;

  input: unknown;

  name: string;

  type: 'tool_use';
}

export interface BetaToolUseBlockParam {
  id: string;

  input: unknown;

  name: string;

  type: 'tool_use';

  cache_control?: BetaCacheControlEphemeral | null;
}

export interface BetaUsage {
  /**
   * The number of input tokens used to create the cache entry.
   */
  cache_creation_input_tokens: number | null;

  /**
   * The number of input tokens read from the cache.
   */
  cache_read_input_tokens: number | null;

  /**
   * The number of input tokens which were used.
   */
  input_tokens: number;

  /**
   * The number of output tokens which were used.
   */
  output_tokens: number;
}

export type MessageCreateParams = MessageCreateParamsNonStreaming | MessageCreateParamsStreaming;

export interface MessageCreateParamsBase {
  /**
   * Body param: The maximum number of tokens to generate before stopping.
   *
   * Note that our models may stop _before_ reaching this maximum. This parameter
   * only specifies the absolute maximum number of tokens to generate.
   *
   * Different models have different maximum values for this parameter. See
   * [models](https://docs.anthropic.com/en/docs/models-overview) for details.
   */
  max_tokens: number;

  /**
   * Body param: Input messages.
   *
   * Our models are trained to operate on alternating `user` and `assistant`
   * conversational turns. When creating a new `Message`, you specify the prior
   * conversational turns with the `messages` parameter, and the model then generates
   * the next `Message` in the conversation. Consecutive `user` or `assistant` turns
   * in your request will be combined into a single turn.
   *
   * Each input message must be an object with a `role` and `content`. You can
   * specify a single `user`-role message, or you can include multiple `user` and
   * `assistant` messages.
   *
   * If the final message uses the `assistant` role, the response content will
   * continue immediately from the content in that message. This can be used to
   * constrain part of the model's response.
   *
   * Example with a single `user` message:
   *
   * ```json
   * [{ "role": "user", "content": "Hello, Claude" }]
   * ```
   *
   * Example with multiple conversational turns:
   *
   * ```json
   * [
   *   { "role": "user", "content": "Hello there." },
   *   { "role": "assistant", "content": "Hi, I'm Claude. How can I help you?" },
   *   { "role": "user", "content": "Can you explain LLMs in plain English?" }
   * ]
   * ```
   *
   * Example with a partially-filled response from Claude:
   *
   * ```json
   * [
   *   {
   *     "role": "user",
   *     "content": "What's the Greek name for Sun? (A) Sol (B) Helios (C) Sun"
   *   },
   *   { "role": "assistant", "content": "The best answer is (" }
   * ]
   * ```
   *
   * Each input message `content` may be either a single `string` or an array of
   * content blocks, where each block has a specific `type`. Using a `string` for
   * `content` is shorthand for an array of one content block of type `"text"`. The
   * following input messages are equivalent:
   *
   * ```json
   * { "role": "user", "content": "Hello, Claude" }
   * ```
   *
   * ```json
   * { "role": "user", "content": [{ "type": "text", "text": "Hello, Claude" }] }
   * ```
   *
   * Starting with Claude 3 models, you can also send image content blocks:
   *
   * ```json
   * {
   *   "role": "user",
   *   "content": [
   *     {
   *       "type": "image",
   *       "source": {
   *         "type": "base64",
   *         "media_type": "image/jpeg",
   *         "data": "/9j/4AAQSkZJRg..."
   *       }
   *     },
   *     { "type": "text", "text": "What is in this image?" }
   *   ]
   * }
   * ```
   *
   * We currently support the `base64` source type for images, and the `image/jpeg`,
   * `image/png`, `image/gif`, and `image/webp` media types.
   *
   * See [examples](https://docs.anthropic.com/en/api/messages-examples#vision) for
   * more input examples.
   *
   * Note that if you want to include a
   * [system prompt](https://docs.anthropic.com/en/docs/system-prompts), you can use
   * the top-level `system` parameter — there is no `"system"` role for input
   * messages in the Messages API.
   */
  messages: Array<BetaMessageParam>;

  /**
   * Body param: The model that will complete your prompt.\n\nSee
   * [models](https://docs.anthropic.com/en/docs/models-overview) for additional
   * details and options.
   */
  model: MessagesAPI.Model;

  /**
   * Body param: An object describing metadata about the request.
   */
  metadata?: BetaMetadata;

  /**
   * Body param: Custom text sequences that will cause the model to stop generating.
   *
   * Our models will normally stop when they have naturally completed their turn,
   * which will result in a response `stop_reason` of `"end_turn"`.
   *
   * If you want the model to stop generating when it encounters custom strings of
   * text, you can use the `stop_sequences` parameter. If the model encounters one of
   * the custom sequences, the response `stop_reason` value will be `"stop_sequence"`
   * and the response `stop_sequence` value will contain the matched stop sequence.
   */
  stop_sequences?: Array<string>;

  /**
   * Body param: Whether to incrementally stream the response using server-sent
   * events.
   *
   * See [streaming](https://docs.anthropic.com/en/api/messages-streaming) for
   * details.
   */
  stream?: boolean;

  /**
   * Body param: System prompt.
   *
   * A system prompt is a way of providing context and instructions to Claude, such
   * as specifying a particular goal or role. See our
   * [guide to system prompts](https://docs.anthropic.com/en/docs/system-prompts).
   */
  system?: string | Array<BetaTextBlockParam>;

  /**
   * Body param: Amount of randomness injected into the response.
   *
   * Defaults to `1.0`. Ranges from `0.0` to `1.0`. Use `temperature` closer to `0.0`
   * for analytical / multiple choice, and closer to `1.0` for creative and
   * generative tasks.
   *
   * Note that even with `temperature` of `0.0`, the results will not be fully
   * deterministic.
   */
  temperature?: number;

  /**
   * Body param: How the model should use the provided tools. The model can use a
   * specific tool, any available tool, or decide by itself.
   */
  tool_choice?: BetaToolChoice;

  /**
   * Body param: Definitions of tools that the model may use.
   *
   * If you include `tools` in your API request, the model may return `tool_use`
   * content blocks that represent the model's use of those tools. You can then run
   * those tools using the tool input generated by the model and then optionally
   * return results back to the model using `tool_result` content blocks.
   *
   * Each tool definition includes:
   *
   * - `name`: Name of the tool.
   * - `description`: Optional, but strongly-recommended description of the tool.
   * - `input_schema`: [JSON schema](https://json-schema.org/) for the tool `input`
   *   shape that the model will produce in `tool_use` output content blocks.
   *
   * For example, if you defined `tools` as:
   *
   * ```json
   * [
   *   {
   *     "name": "get_stock_price",
   *     "description": "Get the current stock price for a given ticker symbol.",
   *     "input_schema": {
   *       "type": "object",
   *       "properties": {
   *         "ticker": {
   *           "type": "string",
   *           "description": "The stock ticker symbol, e.g. AAPL for Apple Inc."
   *         }
   *       },
   *       "required": ["ticker"]
   *     }
   *   }
   * ]
   * ```
   *
   * And then asked the model "What's the S&P 500 at today?", the model might produce
   * `tool_use` content blocks in the response like this:
   *
   * ```json
   * [
   *   {
   *     "type": "tool_use",
   *     "id": "toolu_01D7FLrfh4GYq7yT1ULFeyMV",
   *     "name": "get_stock_price",
   *     "input": { "ticker": "^GSPC" }
   *   }
   * ]
   * ```
   *
   * You might then run your `get_stock_price` tool with `{"ticker": "^GSPC"}` as an
   * input, and return the following back to the model in a subsequent `user`
   * message:
   *
   * ```json
   * [
   *   {
   *     "type": "tool_result",
   *     "tool_use_id": "toolu_01D7FLrfh4GYq7yT1ULFeyMV",
   *     "content": "259.75 USD"
   *   }
   * ]
   * ```
   *
   * Tools can be used for workflows that include running client-side tools and
   * functions, or more generally whenever you want the model to produce a particular
   * JSON structure of output.
   *
   * See our [guide](https://docs.anthropic.com/en/docs/tool-use) for more details.
   */
  tools?: Array<BetaToolUnion>;

  /**
   * Body param: Only sample from the top K options for each subsequent token.
   *
   * Used to remove "long tail" low probability responses.
   * [Learn more technical details here](https://towardsdatascience.com/how-to-sample-from-language-models-682bceb97277).
   *
   * Recommended for advanced use cases only. You usually only need to use
   * `temperature`.
   */
  top_k?: number;

  /**
   * Body param: Use nucleus sampling.
   *
   * In nucleus sampling, we compute the cumulative distribution over all the options
   * for each subsequent token in decreasing probability order and cut it off once it
   * reaches a particular probability specified by `top_p`. You should either alter
   * `temperature` or `top_p`, but not both.
   *
   * Recommended for advanced use cases only. You usually only need to use
   * `temperature`.
   */
  top_p?: number;

  /**
   * Header param: Optional header to specify the beta version(s) you want to use.
   */
  betas?: Array<BetaAPI.AnthropicBeta>;
}

export namespace MessageCreateParams {
  export type MessageCreateParamsNonStreaming = MessagesMessagesAPI.MessageCreateParamsNonStreaming;
  export type MessageCreateParamsStreaming = MessagesMessagesAPI.MessageCreateParamsStreaming;
}

export interface MessageCreateParamsNonStreaming extends MessageCreateParamsBase {
  /**
   * Body param: Whether to incrementally stream the response using server-sent
   * events.
   *
   * See [streaming](https://docs.anthropic.com/en/api/messages-streaming) for
   * details.
   */
  stream?: false;
}

export interface MessageCreateParamsStreaming extends MessageCreateParamsBase {
  /**
   * Body param: Whether to incrementally stream the response using server-sent
   * events.
   *
   * See [streaming](https://docs.anthropic.com/en/api/messages-streaming) for
   * details.
   */
  stream: true;
}

export interface MessageCountTokensParams {
  /**
   * Body param: Input messages.
   *
   * Our models are trained to operate on alternating `user` and `assistant`
   * conversational turns. When creating a new `Message`, you specify the prior
   * conversational turns with the `messages` parameter, and the model then generates
   * the next `Message` in the conversation. Consecutive `user` or `assistant` turns
   * in your request will be combined into a single turn.
   *
   * Each input message must be an object with a `role` and `content`. You can
   * specify a single `user`-role message, or you can include multiple `user` and
   * `assistant` messages.
   *
   * If the final message uses the `assistant` role, the response content will
   * continue immediately from the content in that message. This can be used to
   * constrain part of the model's response.
   *
   * Example with a single `user` message:
   *
   * ```json
   * [{ "role": "user", "content": "Hello, Claude" }]
   * ```
   *
   * Example with multiple conversational turns:
   *
   * ```json
   * [
   *   { "role": "user", "content": "Hello there." },
   *   { "role": "assistant", "content": "Hi, I'm Claude. How can I help you?" },
   *   { "role": "user", "content": "Can you explain LLMs in plain English?" }
   * ]
   * ```
   *
   * Example with a partially-filled response from Claude:
   *
   * ```json
   * [
   *   {
   *     "role": "user",
   *     "content": "What's the Greek name for Sun? (A) Sol (B) Helios (C) Sun"
   *   },
   *   { "role": "assistant", "content": "The best answer is (" }
   * ]
   * ```
   *
   * Each input message `content` may be either a single `string` or an array of
   * content blocks, where each block has a specific `type`. Using a `string` for
   * `content` is shorthand for an array of one content block of type `"text"`. The
   * following input messages are equivalent:
   *
   * ```json
   * { "role": "user", "content": "Hello, Claude" }
   * ```
   *
   * ```json
   * { "role": "user", "content": [{ "type": "text", "text": "Hello, Claude" }] }
   * ```
   *
   * Starting with Claude 3 models, you can also send image content blocks:
   *
   * ```json
   * {
   *   "role": "user",
   *   "content": [
   *     {
   *       "type": "image",
   *       "source": {
   *         "type": "base64",
   *         "media_type": "image/jpeg",
   *         "data": "/9j/4AAQSkZJRg..."
   *       }
   *     },
   *     { "type": "text", "text": "What is in this image?" }
   *   ]
   * }
   * ```
   *
   * We currently support the `base64` source type for images, and the `image/jpeg`,
   * `image/png`, `image/gif`, and `image/webp` media types.
   *
   * See [examples](https://docs.anthropic.com/en/api/messages-examples#vision) for
   * more input examples.
   *
   * Note that if you want to include a
   * [system prompt](https://docs.anthropic.com/en/docs/system-prompts), you can use
   * the top-level `system` parameter — there is no `"system"` role for input
   * messages in the Messages API.
   */
  messages: Array<BetaMessageParam>;

  /**
   * Body param: The model that will complete your prompt.\n\nSee
   * [models](https://docs.anthropic.com/en/docs/models-overview) for additional
   * details and options.
   */
  model: MessagesAPI.Model;

  /**
   * Body param: System prompt.
   *
   * A system prompt is a way of providing context and instructions to Claude, such
   * as specifying a particular goal or role. See our
   * [guide to system prompts](https://docs.anthropic.com/en/docs/system-prompts).
   */
  system?: string | Array<BetaTextBlockParam>;

  /**
   * Body param: How the model should use the provided tools. The model can use a
   * specific tool, any available tool, or decide by itself.
   */
  tool_choice?: BetaToolChoice;

  /**
   * Body param: Definitions of tools that the model may use.
   *
   * If you include `tools` in your API request, the model may return `tool_use`
   * content blocks that represent the model's use of those tools. You can then run
   * those tools using the tool input generated by the model and then optionally
   * return results back to the model using `tool_result` content blocks.
   *
   * Each tool definition includes:
   *
   * - `name`: Name of the tool.
   * - `description`: Optional, but strongly-recommended description of the tool.
   * - `input_schema`: [JSON schema](https://json-schema.org/) for the tool `input`
   *   shape that the model will produce in `tool_use` output content blocks.
   *
   * For example, if you defined `tools` as:
   *
   * ```json
   * [
   *   {
   *     "name": "get_stock_price",
   *     "description": "Get the current stock price for a given ticker symbol.",
   *     "input_schema": {
   *       "type": "object",
   *       "properties": {
   *         "ticker": {
   *           "type": "string",
   *           "description": "The stock ticker symbol, e.g. AAPL for Apple Inc."
   *         }
   *       },
   *       "required": ["ticker"]
   *     }
   *   }
   * ]
   * ```
   *
   * And then asked the model "What's the S&P 500 at today?", the model might produce
   * `tool_use` content blocks in the response like this:
   *
   * ```json
   * [
   *   {
   *     "type": "tool_use",
   *     "id": "toolu_01D7FLrfh4GYq7yT1ULFeyMV",
   *     "name": "get_stock_price",
   *     "input": { "ticker": "^GSPC" }
   *   }
   * ]
   * ```
   *
   * You might then run your `get_stock_price` tool with `{"ticker": "^GSPC"}` as an
   * input, and return the following back to the model in a subsequent `user`
   * message:
   *
   * ```json
   * [
   *   {
   *     "type": "tool_result",
   *     "tool_use_id": "toolu_01D7FLrfh4GYq7yT1ULFeyMV",
   *     "content": "259.75 USD"
   *   }
   * ]
   * ```
   *
   * Tools can be used for workflows that include running client-side tools and
   * functions, or more generally whenever you want the model to produce a particular
   * JSON structure of output.
   *
   * See our [guide](https://docs.anthropic.com/en/docs/tool-use) for more details.
   */
  tools?: Array<BetaTool | BetaToolComputerUse20241022 | BetaToolBash20241022 | BetaToolTextEditor20241022>;

  /**
   * Header param: Optional header to specify the beta version(s) you want to use.
   */
  betas?: Array<BetaAPI.AnthropicBeta>;
}

Messages.Batches = Batches;
Messages.BetaMessageBatchesPage = BetaMessageBatchesPage;

export declare namespace Messages {
  export {
    type BetaBase64PDFBlock as BetaBase64PDFBlock,
    type BetaBase64PDFSource as BetaBase64PDFSource,
    type BetaCacheControlEphemeral as BetaCacheControlEphemeral,
    type BetaContentBlock as BetaContentBlock,
    type BetaContentBlockParam as BetaContentBlockParam,
    type BetaImageBlockParam as BetaImageBlockParam,
    type BetaInputJSONDelta as BetaInputJSONDelta,
    type BetaMessage as BetaMessage,
    type BetaMessageDeltaUsage as BetaMessageDeltaUsage,
    type BetaMessageParam as BetaMessageParam,
    type BetaMessageTokensCount as BetaMessageTokensCount,
    type BetaMetadata as BetaMetadata,
    type BetaRawContentBlockDeltaEvent as BetaRawContentBlockDeltaEvent,
    type BetaRawContentBlockStartEvent as BetaRawContentBlockStartEvent,
    type BetaRawContentBlockStopEvent as BetaRawContentBlockStopEvent,
    type BetaRawMessageDeltaEvent as BetaRawMessageDeltaEvent,
    type BetaRawMessageStartEvent as BetaRawMessageStartEvent,
    type BetaRawMessageStopEvent as BetaRawMessageStopEvent,
    type BetaRawMessageStreamEvent as BetaRawMessageStreamEvent,
    type BetaTextBlock as BetaTextBlock,
    type BetaTextBlockParam as BetaTextBlockParam,
    type BetaTextDelta as BetaTextDelta,
    type BetaTool as BetaTool,
    type BetaToolBash20241022 as BetaToolBash20241022,
    type BetaToolChoice as BetaToolChoice,
    type BetaToolChoiceAny as BetaToolChoiceAny,
    type BetaToolChoiceAuto as BetaToolChoiceAuto,
    type BetaToolChoiceTool as BetaToolChoiceTool,
    type BetaToolComputerUse20241022 as BetaToolComputerUse20241022,
    type BetaToolResultBlockParam as BetaToolResultBlockParam,
    type BetaToolTextEditor20241022 as BetaToolTextEditor20241022,
    type BetaToolUnion as BetaToolUnion,
    type BetaToolUseBlock as BetaToolUseBlock,
    type BetaToolUseBlockParam as BetaToolUseBlockParam,
    type BetaUsage as BetaUsage,
    type MessageCreateParams as MessageCreateParams,
    type MessageCreateParamsNonStreaming as MessageCreateParamsNonStreaming,
    type MessageCreateParamsStreaming as MessageCreateParamsStreaming,
    type MessageCountTokensParams as MessageCountTokensParams,
  };

  export {
    Batches as Batches,
    type BetaMessageBatch as BetaMessageBatch,
    type BetaMessageBatchCanceledResult as BetaMessageBatchCanceledResult,
    type BetaMessageBatchErroredResult as BetaMessageBatchErroredResult,
    type BetaMessageBatchExpiredResult as BetaMessageBatchExpiredResult,
    type BetaMessageBatchIndividualResponse as BetaMessageBatchIndividualResponse,
    type BetaMessageBatchRequestCounts as BetaMessageBatchRequestCounts,
    type BetaMessageBatchResult as BetaMessageBatchResult,
    type BetaMessageBatchSucceededResult as BetaMessageBatchSucceededResult,
    BetaMessageBatchesPage as BetaMessageBatchesPage,
    type BatchCreateParams as BatchCreateParams,
    type BatchRetrieveParams as BatchRetrieveParams,
    type BatchListParams as BatchListParams,
    type BatchCancelParams as BatchCancelParams,
    type BatchResultsParams as BatchResultsParams,
  };
}