import { orderStatusLabel, type MatterStatus, type OrderStatus } from "@/lib/store/types";

const orderTone: Record<OrderStatus, string> = {
  received: "pill-emerald-soft",
  "in-review": "pill-emerald-soft",
  "name-check": "pill-emerald",
  filed: "pill-emerald",
  "awaiting-registry": "pill",
  completed: "pill-emerald-soft",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`pill ${orderTone[status]}`}>{orderStatusLabel(status)}</span>;
}

const matterLabels: Record<MatterStatus, string> = {
  received: "Received",
  assigned: "Assigned",
  "in-progress": "In progress",
  filed: "Filed",
  completed: "Completed",
};

export function MatterStatusBadge({ status }: { status: MatterStatus }) {
  return <span className="pill pill-emerald-soft">{matterLabels[status]}</span>;
}
