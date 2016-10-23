
let nssocket = require('nssocket')

let outbound = new nssocket.NsSocket({
  reconnect: true,
  type: 'tcp4',
});

// outbound.data(['message', 'status'], (data) => {
//   console.log(data);
// })

outbound.data(['message', 'sync'], (data) => {
  console.log(data);
})

outbound.connect(8001)
