import { ENTITY_TYPES, SAFE_PROPERTIES } from "../defaults";

/**
 * Removes properties from a given `entity`
 * @param entity Your entity
 * @param type: Your entity's type see {@link ENTITY_TYPES}
 * @returns Your entity but with ONLY the listed properties. See {@link SAFE_PROPERTIES}
 */
export default function clean(entity: any, type: ENTITY_TYPES) {
  const safeProperties = SAFE_PROPERTIES[type];
  Object.keys(entity).forEach(
    (key) => safeProperties.includes(key) || delete entity[key]
  );

  return entity;
}