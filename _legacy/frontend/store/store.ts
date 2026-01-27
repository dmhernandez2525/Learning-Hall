import { createStore, applyMiddleware, Store, AnyAction } from 'redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger';
import rootReducer, { RootState } from '../reducers/root_reducer';

export type AppStore = Store<RootState, AnyAction>;

const configureStore = (preloadedState: Partial<RootState> = {}): AppStore => {
  return createStore(
    rootReducer,
    preloadedState as RootState,
    applyMiddleware(thunk, logger)
  );
};

export default configureStore;
