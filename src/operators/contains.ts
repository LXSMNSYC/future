/**
 * @license
 * MIT License
 *
 * Copyright (c) 2019 Alexis Munsayac
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 *
 * @author Alexis Munsayac <alexis.munsayac@gmail.com>
 * @copyright Alexis Munsayac 2019
 */
import Future from '../future';
import { FutureTransformer } from '../transformer';
import { Predicate2 } from '../utils/types/function';
import Computation from '../computation';
import WithUpstreamSubscription from '../utils/subscriptions/with-upstream-subscription';

class FutureContains<A, B> extends Future<boolean> {
  constructor(private upstream: Future<A>, private value: B, private comparer: Predicate2<A, B>) {
    super();
  }

  get(): Computation<boolean> {
    const computation = this.upstream.get();

    const subscription = new WithUpstreamSubscription(computation);

    const promise = new Promise<boolean>(async (resolve, reject) => {
      const res = (value: boolean) => !subscription.cancelled && resolve(value);

      try {
        res(this.comparer(await computation, this.value));
      } catch (err) {
        reject(err);
        subscription.cancel();
      }
    });

    return new Computation<boolean>(promise, subscription);
  }
}

const COMPARER = <A, B>(a: A, b: B) => Object.is(a, b);

/**
 * Compares the resolved value with the given value and comparer and resolves with the comparer result.
 * 
 * Default comparer is the Object.is function.
 * 
 * @category Transformers
 * @param value the value to be compared with the resolved value.
 * @param comparer a function that compares two values.
 * @typeparam A type of the computed value
 * @typeparam B type of the value to be compared with.
 */
export default function contains<A, B>(value: B, comparer: Predicate2<A, B> = COMPARER): FutureTransformer<A, boolean> {
  return (future: Future<A>): Future<boolean> => new FutureContains<A, B>(future, value, comparer);
}