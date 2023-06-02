const ok = (data) => {
  const resData = {
    data,
    success: true,
  }
  return new Response(JSON.stringify(resData), {
    headers: { 'content-type': 'application/json;charset=UTF-8' },
  });
}

const err = (msg) => {
  const resData = {
    msg,
    success: false,
  }
  return new Response(JSON.stringify(resData), {
    headers: { 'content-type': 'application/json;charset=UTF-8' },
  });
}

const dbResult = (result) => {
  if (result.success) {
    return ok(result.results);
  } else {
    return err(result.msg || '数据查询失败');
  }
}

export {
  ok,
  err,
  dbResult
}