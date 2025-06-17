import { KeyOf, ObjectOrType }   from '@itrocks/class-type'
import { decorate, decoratorOf } from '@itrocks/decorator/property'

const RANGE = Symbol('range')

type Ranged = bigint | number | string | Date

interface RangeType
{
	minValue: Ranged,
	maxValue: Ranged
}

export function Range<T extends object>(minValue?: Ranged, maxValue?: Ranged)
{
	return decorate<T>(RANGE, ((minValue === undefined) && (maxValue === undefined)) ? undefined : { minValue, maxValue })
}

export function rangeOf<T extends object>(target: ObjectOrType<T>, property: KeyOf<T>)
{
	return decoratorOf<RangeType | undefined, T>(target, property, RANGE, undefined)
}
