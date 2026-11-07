// A plain answer followed by the nudge's "No findings" must keep the answer.
it('keeps the reply that the findings nudge interrupted', async () => {
  const gossipAgent = {
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    sendEnvelope: jest.fn().mockResolvedValue(undefined),
    subscribe: jest.fn().mockResolvedValue(undefined),
    unsubscribe: jest.fn().mockResolvedValue(undefined),
  };
  jest.resetModules();
  jest.doMock('@gossip/client', () => ({ GossipAgent: jest.fn(() => gossipAgent) }));
  const { WorkerAgent } = require('@gossip/orchestrator');

  const generate = jest.fn()
    .mockResolvedValueOnce({ text: 'cmake_minimum_required(VERSION 3.20)' })
    .mockResolvedValueOnce({ text: 'No findings' });
  const worker = new WorkerAgent('test-agent', { generate }, 'ws://localhost:9999', []);
  await worker.start();

  let result = '';
  for await (const event of worker.executeTask('Report as <agent_finding> tags.')) {
    if ((event as any).payload?.result) result = (event as any).payload.result;
  }

  expect(generate).toHaveBeenCalledTimes(2);
  expect(result).toContain('cmake_minimum_required(VERSION 3.20)');
  expect(result).toContain('No findings');
  await worker.stop?.();
});
