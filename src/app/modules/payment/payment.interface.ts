export interface IPaymentData {
  user: string;
  route: string;
  bus: string;
  schedule: string;
  nfcUID: string;
  coords: [number, number];
}
