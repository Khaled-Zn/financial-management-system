import { PrismaClient } from '@prisma/client';
import { Permission } from 'src/global/enums';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();
async function main() {
  const permissions: string[] = [];
  Object.values(Permission).forEach((permission) => {
    permissions.push(permission);
  });

  const createdPermissions = [];

  const company = await prisma.company.create({
    data: {
      name: 'company 1',
      endDate: new Date(new Date().setFullYear(2025)).toISOString(),
    },
  });

  for (let index = 0; index < permissions.length; index++) {
    createdPermissions.push(
      await prisma.permission.create({
        data: {
          title: permissions[index],
          company: { connect: { id: company.id } },
        },
      }),
    );
  }

  await prisma.user.create({
    data: {
      fullName: 'owner',
      phonenumber: '123',
      company: { connect: { id: company.id } },
      email: 'user@gmail.com',
      password: await bcrypt.hash('password', 10),
      role: {
        create: {
          company: { connect: { id: company.id } },
          roleName: 'all',
          permissions: {
            connect: createdPermissions,
          },
        },
      },
    },
  });
  await prisma.owner.create({
    data: {
      fullName: 'owner',
      phonenumber: '123',
      email: 'owner@gmail.com',
      password: await bcrypt.hash('12345678', 10),
    },
  });
  await prisma.client.create({
    data: {
      company: { connect: { id: company.id } },
      email: 'client.1@client.com',
      fullName: 'client.1',
      phone: '0988241787',
    },
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
