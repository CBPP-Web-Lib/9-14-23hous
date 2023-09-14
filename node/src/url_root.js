var url_root

const url_root_gen = () => {
  const script = document.querySelectorAll("#script_hous9-14-23")[0]
  return script.src.replace(/js\/app(\.min)*\.js(.*)/g,"")
}

if (typeof(url_root)==="undefined") {
  url_root = url_root_gen()
}

export { url_root }