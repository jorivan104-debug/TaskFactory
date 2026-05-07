// @ts-nocheck

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { LexiDevelopmentWebhookDto } from './dto/lexi-development-webhook.dto';
import * as crypto from 'crypto';

@Injectable()
export class WebhooksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  validateLexiSignature(payload: string, signature: string): boolean {
    const secret = this.config.get<string>('LEXI_WEBHOOK_SECRET', 'lexi-secret');
    const expected = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'utf8'),
      Buffer.from(expected, 'utf8'),
    );
  }

  async handleLexiDevelopment(dto: LexiDevelopmentWebhookDto, rawBody: string, signature: string) {
    if (!this.validateLexiSignature(rawBody, signature)) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    return this.prisma.development.upsert({
      where: { lexiExternalId: dto.externalId },
      update: {
        title: dto.title,
        imageUrl: dto.imageUrl,
        attributesJson: dto.attributesJson,
        status: dto.status ?? 'received',
      },
      create: {
        lexiExternalId: dto.externalId,
        title: dto.title,
        imageUrl: dto.imageUrl,
        attributesJson: dto.attributesJson,
        status: dto.status ?? 'received',
      },
    });
  }
}
