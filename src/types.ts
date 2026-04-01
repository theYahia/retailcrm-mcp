export interface RetailCrmOrder {
  id: number;
  externalId?: string;
  number: string;
  status: string;
  orderType: string;
  totalSumm: number;
  customer?: { id: number; firstName?: string; lastName?: string; email?: string; phones?: { number: string }[] };
  items: { offer: { displayName: string }; quantity: number; initialPrice: number }[];
  createdAt: string;
  delivery?: { code: string; cost: number; address?: { text: string } };
  payments?: Record<string, { type: string; amount: number; status: string }>;
}

export interface RetailCrmCustomer {
  id: number;
  externalId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phones?: { number: string }[];
  address?: { text?: string; city?: string; region?: string; country?: string };
  createdAt: string;
  ordersCount?: number;
  totalSumm?: number;
  customFields?: Record<string, unknown>;
}

export interface RetailCrmPagination {
  limit: number;
  totalCount: number;
  currentPage: number;
  totalPageCount: number;
}

export interface RetailCrmProduct {
  id: number;
  name: string;
  article?: string;
  url?: string;
  active: boolean;
  groups?: { id: number; name: string }[];
  offers?: { id: number; name: string; price: number; quantity?: number }[];
}

export interface RetailCrmStatus {
  code: string;
  name: string;
  active: boolean;
  group: string;
  ordering: number;
}

export interface RetailCrmDeliveryType {
  code: string;
  name: string;
  active: boolean;
  defaultCost?: number;
  defaultForCrm?: boolean;
}

export interface RetailCrmPaymentType {
  code: string;
  name: string;
  active: boolean;
  defaultForCrm?: boolean;
}

export interface RetailCrmStore {
  code: string;
  name: string;
  active: boolean;
  type?: string;
  address?: { text?: string };
}
