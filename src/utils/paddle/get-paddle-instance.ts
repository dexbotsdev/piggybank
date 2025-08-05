import { Environment, LogLevel, Paddle, PaddleOptions } from '@paddle/paddle-node-sdk';

export function getPaddleInstance() {
  const paddleOptions: PaddleOptions = {
    environment: (process.env.NEXT_PUBLIC_PADDLE_ENV as Environment) ?? Environment.sandbox,
    logLevel: LogLevel.verbose,
  };

  // if (!process.env.PADDLE_API_KEY) {
  //   console.error('Paddle API key is missing');
  // }
  console.log(process.env.PADDLE_API_KEY);

  return new Paddle(process.env.PADDLE_API_KEY!, paddleOptions);
}
