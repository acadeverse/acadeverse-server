import app from './config/express';
import vars from './config/vars';

app.listen(vars.port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${vars.port}`);
});