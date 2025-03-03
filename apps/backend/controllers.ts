
// import { Request, Response } from 'express';
// import * as services from './services';

export async function nothing() {} // to make it a module => if you add a function, you can remove


/*
export async function somethingController(req: Request, res: Response) {
  try {

    const { x, y, z } = req.body as RequestBodyInterface;  => for type safety, define an interface so you know what you are getting

    const returnObject = services.doSomething(x,y,z) => services usually interact with the database, or call other services etc.

    if (!returnObject) {
      return res.status(400).json({ error: 'We tried to do something and it failed, but we know exactly what went wrong so we can return you a nice error code for clarity'})
    }

    const responseBody: ResponseBodyInterface = { obj: returnObject };
    return res.status(201).json(responseBody);

  } catch (error) {
    console.error('We got an error but it wasn't expected, so log it:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
*/