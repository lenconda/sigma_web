import { Dispatch } from '../../components/TaskList';

class Dispatcher {
  private isDispatching = false;
  private dispatchQueue: Dispatch[] = [];
  private interval: ReturnType<typeof setInterval>;

  public start(intervalMilliseconds: number = 1000) {
    this.interval = setInterval(() => {
      if (!this.isDispatching && this.dispatchQueue.length !== 0) {
        this.isDispatching = true;
        const dispatches = Array.from(this.dispatchQueue);
        this.dispatchQueue = [];
        this.dispatch().then(res => {
          console.log('dispatching: ', dispatches);
        }).finally(() => {
          this.isDispatching = false;
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