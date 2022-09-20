export type Call = {
  args: any[];
  key: string;
  date: string;
  mockedBehaviour: Function;
  previousCalls: Call[];
};
