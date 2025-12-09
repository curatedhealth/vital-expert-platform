import { useInteractiveStore } from '../stores/interactive-store';
import { StreamEvent } from '../types/events';

export const handleStreamEvent = (event: StreamEvent) => {
  const store = useInteractiveStore.getState();

  switch (event.type) {
    case 'ui_update':
      if (event.component === 'VitalThinking' && event.props?.steps?.length) {
        const step = event.props.steps[event.props.steps.length - 1];
        store.updateFromStream({
          type: 'thinking_step',
          data: step,
        });
      }
      if (event.component === 'VitalAgentCard' && event.props?.agent) {
        store.updateFromStream({
          type: 'agent_selected',
          data: event.props.agent,
        });
      }
      break;

    case 'token':
      store.updateFromStream({ type: 'token', data: event.data });
      break;

    case 'citation':
      if (event.data) {
        store.updateFromStream({ type: 'citation', data: event.data });
      }
      break;

    default:
      break;
  }
};
