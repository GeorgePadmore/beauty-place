import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationTemplate, TemplateStatus } from '../entities/notification-template.entity';
import { LoggerService } from '../../common/services/logger.service';

@Injectable()
export class NotificationTemplateService {
  constructor(
    @InjectRepository(NotificationTemplate)
    private templateRepository: Repository<NotificationTemplate>,
    private readonly loggerService: LoggerService,
  ) {}

  async getTemplate(name: string): Promise<NotificationTemplate | null> {
    return await this.templateRepository.findOne({
      where: { name, status: TemplateStatus.ACTIVE, isDeleted: false }
    });
  }

  async createTemplate(template: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    const newTemplate = this.templateRepository.create(template);
    return await this.templateRepository.save(newTemplate);
  }

  async updateTemplate(id: string, updates: Partial<NotificationTemplate>): Promise<NotificationTemplate | null> {
    await this.templateRepository.update(id, updates);
    return await this.templateRepository.findOne({ where: { id } });
  }

  async deleteTemplate(id: string): Promise<void> {
    await this.templateRepository.update(id, { isDeleted: true });
  }
}
