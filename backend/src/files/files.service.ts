import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FilesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.fileUpload.findMany({
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.fileUpload.findUnique({
      where: { id },
    });
  }

  async remove(id: string) {
    await this.prisma.fileUpload.delete({
      where: { id },
    });

    return { message: 'Arquivo removido com sucesso' };
  }
}
