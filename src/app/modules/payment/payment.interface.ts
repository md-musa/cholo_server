export interface IPaymentData {
  userId: string;
  routeId: string;
  busId: string;
  scheduleId: string;
  nfcUid: string;
  checkinCoords: [number, number];
  checkoutCoords: [number, number];
  fareCalculationMethod: "distance" | "stopage";
}
