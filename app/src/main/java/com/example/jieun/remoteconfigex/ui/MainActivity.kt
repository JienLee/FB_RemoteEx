package com.example.jieun.remoteconfigex.ui

import android.os.Bundle
import android.util.Log
import android.widget.TextView
import android.widget.Toast
import com.example.jieun.remoteconfigex.R
import com.example.jieun.remoteconfigex.constrant.RemoteConfigConstrant.WELCOME_MESSAGE_CAPS
import com.example.jieun.remoteconfigex.constrant.RemoteConfigConstrant.WELCOME_MSG
import com.example.jieun.remoteconfigex.ui.base.BaseActivity
import com.google.android.gms.tasks.OnCompleteListener
import com.google.firebase.iid.FirebaseInstanceId

class MainActivity : BaseActivity() {

    private val txtWelcome by lazy {
        findViewById<TextView>(R.id.txtWelcome)
    }
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        // get firebase instance token
        Log.e("IID_TOKEN", FirebaseInstanceId.getInstance().token)
        fetchText()
    }

    fun fetchText(){
        txtWelcome.text = mFirebaseConfig.getString(WELCOME_MSG)

        mFirebaseConfig.fetch(0).addOnCompleteListener(this, OnCompleteListener {
            task ->  task.run{
            if(task.isSuccessful){
                Toast.makeText(this@MainActivity, "Fetch Success", Toast.LENGTH_SHORT).show()
                mFirebaseConfig.activateFetched()
            } else {
                Toast.makeText(this@MainActivity, "Fetch Fail", Toast.LENGTH_SHORT).show()
            }
            displayText()
        }
        })
    }

    fun displayText(){
        val message = mFirebaseConfig.getString(WELCOME_MSG)

        if (mFirebaseConfig.getBoolean(WELCOME_MESSAGE_CAPS)) {
            txtWelcome.setAllCaps(true)
        } else {
            txtWelcome.setAllCaps(false)
        }
        txtWelcome.text = message
    }
}
