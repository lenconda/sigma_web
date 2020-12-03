import { Dispatch } from '../../components/TaskList';
import {
  useState,
  useEffect,
} from 'react';

class Dispatcher {
  public isDispatching = false;
  private dispatchQueue: Dispatch[] = [];
  private interval: ReturnType<typeof setInterval>;
  private dispatchStatus = useState<boolean>(false);

  public useDispatchStatus = (): boolean => {
    const [dispatching, setDispatching] = useState<boolean>(false);
    useEffect(() => {
      const [currentDispatchState] = this.dispatchStatus;
      setDispatching(currentDispatchState);
    }, [this.dispatchStatus]);
    return dispatching;
  };

  public start(intervalMilliseconds: number = 1000) {
    this.interval = setInterval(() => {
      const [dispatchState, setDispatchState] = this.dispatchStatus;
      if (!this.isDispatching && this.dispatchQueue.length !== 0) {
        this.isDispatching = true;
        setDispatchState(true);
        const dispatches = Array.from(this.dispatchQueue);
        this.dispatchQueue = [];
        this.dispatch().then(res => {
          console.log('dispatching: ', dispatches);
        }).finally(() => {
          this.isDispatching = false;
          setDispatchState(false);
        });
      }
    }, intervalMilliseconds);
  }

  public stop() {
    clearInterval(this.interval);
  }

  public enqueue(dispatch: Dispatch) {
    if (!dispatch) { return }
    this.dispatchQueue.push(dispatch);
  }

  private async dispatch() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 400);
    });
  }
}

export default Dispatcher;
