import stateRepo from "../../repositories/location/state.repository";

export const listStates = (search?: string) => {
  return stateRepo.findAll(search);
};
