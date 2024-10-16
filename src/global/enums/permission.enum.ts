export enum Permission {
  READ_ITEMS = 'read items',
  WRITE_ITEMS = 'write items',
  UPDATE_ITEMS = 'update items',
  DELETE_ITEMS = 'delete items',

  READ_PROJECTS = 'read projects',
  WRITE_PROJECTS = 'write projects',
  UPDATE_PROJECTS = 'update projects',
  DELETE_PROJECTS = 'delete projects',

  READ_CLIENTS = 'read clients',
  WRITE_CLIENTS = 'write clients',
  UPDATE_CLIENTS = 'update clients',
  DELETE_CLIENTS = 'delete clients',

  READ_ADMIN_MEMBERS = 'read admin members',
  WRITE_ADMIN_MEMBERS = 'write admin members',
  UPDATE_ADMIN_MEMBERS = 'update admin members',
  DELETE_ADMIN_MEMBERS = 'delete admin members',

  READ_ROLES_AND_PERMISSIONS = 'read roles and permissions',
  WRITE_ROLES_AND_PERMISSIONS = 'write roles and permissions',
  UPDATE_ROLES_AND_PERMISSIONS = 'update roles and permissions',
  DELETE_ROLES_AND_PERMISSIONS = 'delete roles and permissions',

  READ_POS = 'read pos',
  WRITE_POS = 'write pos',
  UPDATE_POS = 'update pos',
  DELETE_POS = 'delete pos',
  REQUEST_POS = 'request pos',

  READ_INVENTORIES = 'read inventories',
  WRITE_INVENTORIES = 'write inventories',
  UPDATE_INVENTORIES = 'update inventories',
  DELETE_INVENTORIES = 'delete inventories',
  REQUEST_INVENTORIES = 'request inventories',

  READ_SALES = 'read sales',
  WRITE_SALES = 'write sales',

  READ_PAYMENTS = 'read payments',
  WRITE_PAYMENTS = 'write payments',
  READ_INVOICES = 'read invoices',
  WRITE_INVOICES = 'write invoices',
}
