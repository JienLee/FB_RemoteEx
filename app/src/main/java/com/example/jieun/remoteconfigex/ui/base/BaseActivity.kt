package com.example.jieun.remoteconfigex.ui.base

import android.os.Bundle
import android.support.v7.app.AppCompatActivity
import com.google.android.gms.common.ConnectionResult
import com.google.android.gms.common.GoogleApiAvailability

/**
 * Created by jieun on 2017. 11. 6..
 */
abstract class BaseActivity : AppCompatActivity(){
    fun checkGooglePlayServices(){
        val availability = GoogleApiAvailability.getInstance()
        var status = availability.isGooglePlayServicesAvailable(this)

        if (status != ConnectionResult.SUCCESS) {
            val dialog = availability.getErrorDialog(this, status, -1)
            dialog.setOnDismissListener{
                finish()
            }
            dialog.show()

            availability.showErrorNotification(this, status)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        checkGooglePlayServices()
    }
}