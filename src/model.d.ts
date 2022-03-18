type dataset = {
    name:string;
    friendlyName:string;
    fields:field[];
    //relations:dataset[];
  }
  
  type field = {
    name:string;
    friendlyName:string;
    type:string;
    isSelected:boolean;
    datasetIndex:number;
  }