import request from "utils/request";

export function getMutasi(params) {
  return request({
    url: `${process.env.NEXT_LOCAL_BASE_URL}/mutation`,
    method: "GET",
    params,
  });
}

export function getDetailMutasi(params) {
  return request({
    url: `${process.env.NEXT_LOCAL_BASE_URL}/mutation/show`,
    method: "GET",
    params,
  });
}

export function deleteMutasi(data) {
  return request({
    url: `${process.env.NEXT_PUBLIC_GATEWAY_BASE_URL}/mutation/item`,
    method: "DELETE",
    data,
  });
}

export function createMutation(data) {
  return request({
    url: `${process.env.NEXT_PUBLIC_GATEWAY_BASE_URL}/mutation`,
    method: "POST",
    data,
  });
}

export function updateMutation(data) {
  return request({
    url: `${process.env.NEXT_PUBLIC_GATEWAY_BASE_URL}/mutation`,
    method: "PATCH",
    data,
  });
}
