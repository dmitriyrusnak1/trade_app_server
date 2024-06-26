import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager'; 
import { ConfigService } from '@nestjs/config'; 
import { APP_FILTER } from '@nestjs/core';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet'; 
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TradeService } from './trade.service';
import { AppGateway } from './app.gateway';
import { HttpExceptionFilter } from './http.exception.filter';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot(),
    CacheModule.registerAsync({  
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({  
        store: await redisStore({  
          socket: {  
            host: configService.get('REDIS_HOST'), 
            port: configService.get('REDIS_PORT'),  
          },        
        }),      
      }),
      inject: [ConfigService],   
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    TradeService,
    AppGateway,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
