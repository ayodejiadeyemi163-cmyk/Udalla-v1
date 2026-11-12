import { orderStatusLabel, type MatterStatus, type OrderStatus } from "@/lib/store/types";

const orderTone: Record<OrderStatus, string> = {
  received: "pill-forest",
  "in-review": "pill-forest",
  "name-check": "pill-marigold",
  filed: "pill-marigold",
  "awaiting-registry": "pill",
  completed: "pill-forest",
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
  return <span className="pill pill-forest">{matterLabels[status]}</span>;
}
