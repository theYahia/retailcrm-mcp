export interface RetailCrmOrder {
  id: number;
  externalId?: string;
  number: string;
  status: string;
  orderType: string;
  totalSumm: number;
  customer?: { id: number; firstName?: string; lastName?: string };
  items: { offer: { displayName: string }; quantity: number; initialPrice: number }[];
  createdAt: string;
  delivery?: { code: string; cost: number; address?: { text: string } };
}

export interface RetailCrmCustomer {
  id: number;
  externalId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phones?: { number: string }[];
  createdAt: string;
  ordersCount?: number;
  totalSumm?: number;
}

export interface RetailCrmPagination {
  limit: number;
  totalCount: number;
  currentPage: number;
  totalPageCount: number;
}
