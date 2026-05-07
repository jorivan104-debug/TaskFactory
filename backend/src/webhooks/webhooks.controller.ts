import { Controller, Post, Body, Headers, Req, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';
import { LexiDevelopmentWebhookDto } from './dto/lexi-development-webhook.dto';
import { Request } from 'express';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly service: WebhooksService) {}

  @Post('lexi/developments')
  @HttpCode(200)
  @ApiOperation({ summary: 'Receive Lexi development webhook' })
  @ApiHeader({ name: 'X-Lexi-Signature', required: true })
  async handleLexiDevelopment(
    @Body() dto: LexiDevelopmentWebhookDto,
    @Headers('x-lexi-signature') signature: string,
    @Req() req: Request,
  ) {
    const rawBody = JSON.stringify(req.body);
    await this.service.handleLexiDevelopment(dto, rawBody, signature);
    return { status: 'ok' };
  }
}
