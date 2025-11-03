import { Request, Response, NextFunction } from "express";
import * as UserService from "../services/user.service";

// export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
//   try { res.json(await UserService.listUsers()); } 
//   catch (err) { next(err); }
// };

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await UserService.getUserById(Number(req.params.id))); } 
  catch (err) { next(err); }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email } = req.body;
    res.status(201).json(await UserService.addUser(name, email));
  } catch (err) { next(err); }
};
