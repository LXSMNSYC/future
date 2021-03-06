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
import Computation from '../computation';
import CompositeSubscription from '../utils/subscriptions/composite-subscription';

class FutureSwitchIfEmpty<T> extends Future<T> {
  constructor(
    private future: Future<T>,
    private other: Future<T>,
  ) {
    super();
  }

  get(): Computation<T> {

    const subscription = new CompositeSubscription();

    const promise = new Promise<T>((resolve, reject) => {
      const res = (value: T) => !subscription.cancelled && resolve(value);
      const rej = (value: Error) => !subscription.cancelled && reject(value);

      const computation = this.future.get();

      subscription.add(computation);

      computation.then(value => {
        if (value == null) {
          subscription.remove(computation);

          const otherComputation = this.other.get();

          otherComputation.then(value => {
            res(value);
          }, (err) => {
            rej(err);
            subscription.cancel();
          });

        } else {
          res(value);
        }
      }, (err) => {
        rej(err);
        subscription.cancel();
      });
    });

    return new Computation<T>(promise, subscription);
  }
}

/**
 * Resolves the [[Computation]] instance with the given value if
 * the [[Computation]] resolves with a null/undefined value.
 * 
 * ```typescript
 * Future.success()
 *  .compose(Future.defaultIfEmpty('Hello'))
 *  .get()
 *  .then(console.log); // Hello
 * ```
 * 
 * @category Transformers
 * @param item a value to be resolved with
 * @typeparam T type of computed and given value
 */
export default function switchIfEmpty<T>(other: Future<T>): FutureTransformer<T, T> {
  return (future: Future<T>): Future<T> => new FutureSwitchIfEmpty(future, other);
}