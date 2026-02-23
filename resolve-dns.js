import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

const hosts = [
    'db.knklvikjjntubslpamjq.supabase.co',
    'knklvikjjntubslpamjq.supabase.co',
    'aws-1-ap-southeast-2.pooler.supabase.com'
];

hosts.forEach(host => {
    dns.resolve4(host, (err, addresses) => {
        if (err) console.error(`ERR [${host}]:`, err.message);
        else console.log(`IP4 [${host}]:`, addresses);
    });
    dns.resolve6(host, (err, addresses) => {
        if (err) console.error(`ERR6 [${host}]:`, err.message);
        else console.log(`IP6 [${host}]:`, addresses);
    });
});
