type dataset = {
    name:string;
    fields:field[];
    //relations:dataset[];
  }
  
  type field = {
    name:string;
    type:string;
    isSelected:boolean;
  }