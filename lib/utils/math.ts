export function average(numbers: number[]) {
  if (numbers.length === 0) {
    return 0;
  }

  const sum = numbers.reduce((acc, curr) => acc + curr, 0);
  const average = sum / numbers.length;

  return average;
}
