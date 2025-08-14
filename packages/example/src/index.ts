import { faker } from '@faker-js/faker';

export function greet(name: string) {
  return `Hello, ${name}!`;
}

export function greetRandom() {
  return greet(faker.person.firstName());
}
