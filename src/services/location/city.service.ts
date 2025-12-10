import cityRepo from "../../repositories/location/city.repository";

export const listCitiesByState = (stateId: number, search?: string) => {
  return cityRepo.findByStateId(stateId, search);
};
