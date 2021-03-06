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
import Computation from '../computation';
import BooleanSubscription from '../utils/subscriptions/boolean-subscription';

class FuturePromise<T> extends Future<T> {
  constructor(private promise: PromiseLike<T>) {
    super();
  }

  get(): Computation<T> {
    const subscription = new BooleanSubscription();

    const promise = new Promise<T>((resolve, reject) => {
      this.promise.then(
        value => !subscription.cancelled && resolve(value),
        error => !subscription.cancelled && reject(error),
      );
    });

    return new Computation<T>(promise, subscription);
  }
}

/**
 * Transforms a Promise instance into a [[Future]].
 * 
 * ```typescript
 * Future.fromPromise(Promise.resolve('Hello World'))
 *  .get()
 *  .then(console.log); // Hello World
 * ```
 * 
 * @category Constructors
 * @param promise 
 * @typeparam T type of the Promise's resolved value
 */
export default function fromPromise<T>(promise: PromiseLike<T>): Future<T> {
  return new FuturePromise<T>(promise);
}