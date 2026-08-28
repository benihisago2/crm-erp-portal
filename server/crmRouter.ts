import { z } from "zod";
import {
  createActivity,
  createCompany,
  createContact,
  createDeal,
  createDocument,
  createTask,
  getCrmSnapshot,
  listActivities,
  listCompanies,
  listContacts,
  listDeals,
  listDocuments,
  listNotifications,
  listTasks,
  markNotificationRead,
  updateCompany,
  updateContact,
  updateDeal,
  updateDocument,
  updateTask,
} from "./db";
import { protectedProcedure, router } from "./_core/trpc";

const idInput = z.object({ id: z.number().int().positive() });
const companyFields = z.object({
  name: z.string().min(1), segment: z.string().min(1), industry: z.string().optional(),
  location: z.string().optional(), ownerName: z.string().optional(), status: z.string().optional(),
});
const contactFields = z.object({
  companyId: z.number().int().positive().optional(), name: z.string().min(1), email: z.string().email().optional(),
  phone: z.string().optional(), role: z.string().optional(), ownerName: z.string().optional(), status: z.string().optional(),
  lastContactAt: z.coerce.date().optional(),
});
const dealFields = z.object({
  companyId: z.number().int().positive().optional(), contactId: z.number().int().positive().optional(),
  title: z.string().min(1), stage: z.string().min(1), amount: z.number().int().nonnegative(), probability: z.number().int().min(0).max(100),
  ownerName: z.string().min(1), nextAction: z.string().optional(), closeDate: z.coerce.date().optional(), status: z.string().optional(),
});
const documentFields = z.object({
  companyId: z.number().int().positive().optional(), dealId: z.number().int().positive().optional(), type: z.string().min(1),
  number: z.string().min(1), status: z.string().min(1), amount: z.number().int().nonnegative(), dueDate: z.coerce.date().optional(), issuedAt: z.coerce.date().optional(),
});
const taskFields = z.object({
  companyId: z.number().int().positive().optional(), dealId: z.number().int().positive().optional(), title: z.string().min(1),
  assignee: z.string().min(1), status: z.string().optional(), priority: z.string().optional(), kind: z.string().optional(), dueAt: z.coerce.date().optional(),
});

export const crmRouter = router({
  snapshot: protectedProcedure.query(() => getCrmSnapshot()),
  companies: router({
    list: protectedProcedure.query(() => listCompanies()),
    create: protectedProcedure.input(companyFields).mutation(({ input }) => createCompany(input)),
    update: protectedProcedure.input(idInput.merge(companyFields.partial())).mutation(({ input }) => {
      const { id, ...values } = input;
      return updateCompany(id, values);
    }),
  }),
  contacts: router({
    list: protectedProcedure.query(() => listContacts()),
    create: protectedProcedure.input(contactFields).mutation(({ input }) => createContact(input)),
    update: protectedProcedure.input(idInput.merge(contactFields.partial())).mutation(({ input }) => {
      const { id, ...values } = input;
      return updateContact(id, values);
    }),
  }),
  deals: router({
    list: protectedProcedure.query(() => listDeals()),
    create: protectedProcedure.input(dealFields).mutation(({ input }) => createDeal(input)),
    update: protectedProcedure.input(idInput.merge(dealFields.partial())).mutation(({ input }) => {
      const { id, ...values } = input;
      return updateDeal(id, values);
    }),
  }),
  documents: router({
    list: protectedProcedure.query(() => listDocuments()),
    create: protectedProcedure.input(documentFields).mutation(({ input }) => createDocument(input)),
    update: protectedProcedure.input(idInput.merge(documentFields.partial())).mutation(({ input }) => {
      const { id, ...values } = input;
      return updateDocument(id, values);
    }),
  }),
  tasks: router({
    list: protectedProcedure.query(() => listTasks()),
    create: protectedProcedure.input(taskFields).mutation(({ input }) => createTask(input)),
    update: protectedProcedure.input(idInput.merge(taskFields.partial())).mutation(({ input }) => {
      const { id, ...values } = input;
      return updateTask(id, values);
    }),
  }),
  activities: router({
    list: protectedProcedure.query(() => listActivities()),
    create: protectedProcedure.input(z.object({
      companyId: z.number().int().positive().optional(), dealId: z.number().int().positive().optional(), contactId: z.number().int().positive().optional(),
      type: z.string().min(1), title: z.string().min(1), body: z.string().optional(), ownerName: z.string().optional(), occurredAt: z.coerce.date().optional(),
    })).mutation(({ input }) => createActivity(input)),
  }),
  notifications: router({
    list: protectedProcedure.query(() => listNotifications()),
    markRead: protectedProcedure.input(idInput).mutation(({ input }) => markNotificationRead(input.id)),
  }),
});
