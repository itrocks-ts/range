import { KeyOf, ObjectOrType }   from '@itrocks/class-type'
import { decorate, decoratorOf } from '@itrocks/decorator/property'

const RANGE = Symbol('range')

interface RangeType
{
	minValue: Date | number | string,
	maxValue: Date | number | string
}

export function Range<T extends object>(minValue: Date | number | string, maxValue: Date | number | string)
{
	return decorate<T>(RANGE, { minValue, maxValue })
}

export function rangeOf<T extends object>(target: ObjectOrType<T>, property: KeyOf<T>)
{
	return decoratorOf<RangeType | undefined, T>(target, property, RANGE, undefined)
}
