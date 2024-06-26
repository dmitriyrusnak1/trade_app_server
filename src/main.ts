import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { SocketIoAdapter } from './socketio.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get('WEBSOCKET_ORIGIN'),
  });

  app.useWebSocketAdapter(new SocketIoAdapter(app, configService));

  const port = configService.get('PORT')

  await app.listen(port);
}
bootstrap();
