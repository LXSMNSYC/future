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
import Computation from '../../computation';
import { Scheduler, TimedScheduler } from '../../scheduler';
import { Action } from '../types/function';
import WithCallbacksSubscription from '../subscriptions/with-callbacks-subscription';
import EmptySubscription from '../subscriptions/empty-subscription';


/**
 * Schedules an [[Action]] synchronously and executes thereafter.
 * @param action
 * @category Schedulers
 */
export const SyncScheduler: Scheduler = (action: Action) => {
  const promise = new Promise((resolve, reject) => {
    try {
      action();
    } catch (err) {
      reject(err);
      return;
    }

    resolve();
  });

  return new Computation<unknown>(promise, EmptySubscription.INSTANCE);
};

/**
 * Schedules an [[Action]] synchronously and executes after a given time delay.
 * @param action
 * @category Schedulers
 */
export const SyncTimedScheduler: TimedScheduler = (action: Action, time: number) => {
  const subscription = new WithCallbacksSubscription();

  const promise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      try {
        action();
      } catch (err) {
        reject(err);
        return;
      }
      resolve();
    }, time);

    subscription.addListener(() => clearTimeout(timeout));
  });

  return new Computation<unknown>(promise, subscription);
};