import { Module } from '@nestjs/common';
import { DocumentBuilderService } from './document-builder.service';

@Module({
  providers: [DocumentBuilderService],
  exports: [DocumentBuilderService],
})
export class DocumentBuilderModule {}
