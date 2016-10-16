/*eslint-env jest, jasmine*/

import { randomNumber } from './random'

describe('randomNumber', () => {

  let randomSpy

  const testRange = (min, max) => {
    randomSpy.and.returnValue(0)
    expect(randomNumber(min, max)).toBe(min)
    randomSpy.and.returnValue(1)
    expect(randomNumber(min, max)).toBe(max)
    randomSpy.and.returnValue(0.5)
    expect(randomNumber(min, max)).toBeLessThan(max + 1)
    expect(randomNumber(min, max)).toBeGreaterThan(min - 1)
  }

  beforeEach(() => {
    randomSpy = spyOn(Math, 'random')
  })

  it('should return random number in range for positive numbers', () => {
    testRange(10, 15)
  })

  it('should return random number in range for negative numbers', () => {
    testRange(-15, -10)
  })

  it('should return random number in range for negative and positive numbers', () => {
    testRange(-10, 15)
  })

  it('should return correct number for small range', () => {
    testRange(10, 11)
  })

  it('should return correct nubers for reverse argument order', () => {
    testRange(5, 9)
  })

})
