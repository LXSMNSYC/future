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
import { Predicate } from '../utils/types/function';
import WithCallbacksSubscription from '../utils/subscriptions/with-callbacks-subscription';

class FutureRetryTimed<T> extends Future<T> {
  constructor(
    private future: Future<T>,
    private time: number,
    private until?: Predicate<Error>,
  ) {
    super();
  }

  get(): Computation<T> {
    const subscription = new WithCallbacksSubscription();

    const promise = new Promise<T>((resolve, reject) => {
      const res = (value: T) => !subscription.cancelled && resolve(value);
      const rej = (value: Error) => !subscription.cancelled && reject(value);

      let expired = false;

      const timeout = setTimeout(() => {
        expired = true;        
      }, this.time);

      subscription.addListener(() => {
        clearTimeout(timeout);
      });

      const retry = () => {
        const computation = this.future.get();

        const listener = () => computation.cancel();
        subscription.addListener(listener);

        computation.then(res, error => {
          if (expired || (this.until && this.until(error))) {
            rej(error);
            subscription.cancel();
          } else {
            subscription.removeListener(listener);
            computation.cancel();
            retry();
          }
        });
      };

      retry();
    });

    return new Computation<T>(promise, subscription);
  }
}

export default function retryTimed<T>(time: number, until?: Predicate<Error>): FutureTransformer<T, T> {
  return (future: Future<T>): Future<T> => new FutureRetryTimed<T>(future, time, until);
}