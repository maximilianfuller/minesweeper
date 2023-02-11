alert("hiya")

type User = {
  name: string;
  age: number;
};

function isAdult(user: User): boolean {
  return user.age >= 18;
}

const justine: User = {
  name: 'Justine',
  age: 23,
};

const isJustineAnAdult: boolean = isAdult(justine);

function sum (num1:number, num2:number){
    return num1 + num2;
}
console.log(sum(8,4))