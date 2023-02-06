import express from 'express';
import routesV1 from '../api/routes/v1';
import error from '../api/middlewares/error.middleware';

const app = express();

app.use(express.json());

app.use('/v1', routesV1);

app.use(error.ConvertToApiError);

app.use(error.Handler);

export default app;