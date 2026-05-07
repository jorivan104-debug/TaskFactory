import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WorkOS } from '@workos-inc/node';

@Injectable()
export class WorkosService {
  private readonly log = new Logger(WorkosService.name);
  private readonly client: WorkOS | null;
  private readonly clientId: string;
  private readonly redirectUri: string;
  private readonly frontendUrl: string;

  constructor(config: ConfigService) {
    const apiKey = (config.get<string>('WORKOS_API_KEY') ?? '').trim();
    this.clientId = (config.get<string>('WORKOS_CLIENT_ID') ?? '').trim();
    this.redirectUri = (config.get<string>('WORKOS_REDIRECT_URI') ?? '').trim();
    this.frontendUrl = (config.get<string>('FRONTEND_URL') ?? '').trim();

    if (apiKey && this.clientId && this.redirectUri) {
      this.client = new WorkOS(apiKey);
      this.log.log('WorkOS habilitado');
    } else {
      this.client = null;
      this.log.warn(
        'WorkOS deshabilitado: faltan WORKOS_API_KEY / WORKOS_CLIENT_ID / WORKOS_REDIRECT_URI',
      );
    }
  }

  isEnabled() {
    return this.client !== null;
  }

  getFrontendUrl() {
    return this.frontendUrl;
  }

  getAuthorizationUrl(state?: string) {
    if (!this.client) {
      throw new ServiceUnavailableException('WorkOS no está configurado en el servidor');
    }
    return this.client.userManagement.getAuthorizationUrl({
      provider: 'authkit',
      clientId: this.clientId,
      redirectUri: this.redirectUri,
      state,
    });
  }

  async authenticateWithCode(code: string) {
    if (!this.client) {
      throw new ServiceUnavailableException('WorkOS no está configurado en el servidor');
    }
    const result = await this.client.userManagement.authenticateWithCode({
      clientId: this.clientId,
      code,
    });
    return result;
  }
}
