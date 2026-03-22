export interface NetworkCategory {
  id: string;
  cover: string;
  name: string;
  children: Array<NetworkCategory>;

}